import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateCommission } from './CreateCommission';
import { commissionApi } from '../../api/commissions';
import { uploadToCloudinary } from '../../utils/upload';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('../../api/commissions');
jest.mock('../../utils/upload');

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('CreateCommission Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CreateCommission />
      </BrowserRouter>
    );
  };

  test('renders step 1 initially', () => {
    renderComponent();
    expect(screen.getByText('Project Basics')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  test('allows entering title and description', () => {
    renderComponent();
    
    const titleInput = screen.getByLabelText(/Project Title/i);
    const descInput = screen.getByLabelText(/Description/i);

    fireEvent.change(titleInput, { target: { value: 'My New Project' } });
    fireEvent.change(descInput, { target: { value: 'A detailed description' } });

    expect(titleInput).toHaveValue('My New Project');
    expect(descInput).toHaveValue('A detailed description');
  });

  test('allows adding and removing tags', () => {
    renderComponent();
    
    const tagInput = screen.getByLabelText(/Tags/i);

    // Add tag
    fireEvent.change(tagInput, { target: { value: 'Cyberpunk' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Cyberpunk')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');

    // Remove tag
    const removeBtn = screen.getByLabelText('Remove tag Cyberpunk');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Cyberpunk')).not.toBeInTheDocument();
  });

  test('navigates to step 2 and adds requirements', () => {
    renderComponent();

    // Fill step 1
    fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Desc' } });

    // Go to next step
    const nextBtn = screen.getByText('Next Step');
    fireEvent.click(nextBtn);

    // Check step 2
    expect(screen.getByText('Requirements & References')).toBeInTheDocument();

    // Add requirement
    const reqInput = screen.getByLabelText(/Specific Requirements/i);
    const addBtn = screen.getByText('Add');

    fireEvent.change(reqInput, { target: { value: 'High Res' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('High Res')).toBeInTheDocument();
  });

  test('submits the form successfully', async () => {
    (uploadToCloudinary as jest.Mock).mockResolvedValue('http://image.url');
    (commissionApi.create as jest.Mock).mockResolvedValue({ id: '123' });

    renderComponent();

    // Step 1
    fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Final Project' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Final Desc' } });
    fireEvent.click(screen.getByText('Next Step'));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Specific Requirements/i), { target: { value: 'Req 1' } });
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Next Step'));

    // Step 3
    expect(screen.getByText('Budget & Timeline')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Deadline/i), { target: { value: '2025-12-31' } });
    
    // Submit
    const createBtn = screen.getByText('Create Project');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(commissionApi.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Final Project',
        description: 'Final Desc',
        price: 100,
        requirements: ['Req 1']
      }));
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/commissions/123');
    });
  });
});
