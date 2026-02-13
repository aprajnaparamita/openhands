import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { commissionApi } from '../api/commissions';
import { Commission } from '../types/commission';

export const BrowseProjects: React.FC = () => {
  const [projects, setProjects] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await commissionApi.getAvailable();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading projects...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Projects</h1>
      
      {projects.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">No available projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/commissions/${project.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 truncate flex-1">{project.title}</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold ml-2">
                    ${project.price}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-15">
                  {project.description}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
