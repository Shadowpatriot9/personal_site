import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const ProjectCatalogContext = createContext(null);

export const ProjectCatalogProvider = ({ value, children }) => (
  <ProjectCatalogContext.Provider value={value}>
    {children}
  </ProjectCatalogContext.Provider>
);

ProjectCatalogProvider.propTypes = {
  value: PropTypes.shape({
    projects: PropTypes.array,
    loading: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export const useProjectCatalog = () => {
  const context = useContext(ProjectCatalogContext);
  if (!context) {
    throw new Error('useProjectCatalog must be used within a ProjectCatalogProvider');
  }
  return context;
};

export default ProjectCatalogContext;
