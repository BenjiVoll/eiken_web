import React from 'react';
import { Search } from 'lucide-react';

const ProjectsSearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="project-search">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Buscar proyectos por título, división o cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="project-search-input"
      />
    </div>
  </div>
);

export default ProjectsSearchBar;
