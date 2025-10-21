import React, { createContext, useContext } from 'react';

const ProjectCatalogContext = createContext(null);

export const ProjectCatalogProvider = ({ value, children }) => (
  <ProjectCatalogContext.Provider value={value}>
    {children}
  </ProjectCatalogContext.Provider>
);

export const useProjectCatalog = () => {
  const context = useContext(ProjectCatalogContext);
  if (!context) {
    throw new Error('useProjectCatalog must be used within a ProjectCatalogProvider');
  }
  return context;
};

export default ProjectCatalogContext;
