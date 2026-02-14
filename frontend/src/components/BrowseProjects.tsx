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

  if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading projects...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Available Projects</h1>
      
      {projects.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-xl">No available projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/commissions/${project.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.title}</h2>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-semibold ml-2 whitespace-nowrap">
                    {project.price} SOL
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 h-15">
                  {project.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
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
