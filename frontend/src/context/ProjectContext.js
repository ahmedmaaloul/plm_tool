// src/context/ProjectContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

export const ProjectContext = createContext();

const API_BASE_URL = 'http://localhost:5005'; // Adjust the port if necessary

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Configure Axios instance
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  };

  // Fetch project by ID
  const fetchProjectById = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}`);
      setProjectDetails(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  };

  // Create a new project
  const createProject = async (projectData) => {
    try {
      const response = await axiosInstance.post('/api/projects', projectData);
      // Update projects list
      setProjects((prevProjects) => [...prevProjects, response.data.project]);
      return response.data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Update an existing project
  const updateProject = async (projectId, projectData) => {
    try {
      const response = await axiosInstance.put(`/api/projects/${projectId}`, projectData);
      // Update project in the state
      setProjects((prevProjects) =>
        prevProjects.map((proj) => (proj._id === projectId ? response.data.project : proj))
      );
      return response.data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}`);
      // Remove project from the state
      setProjects((prevProjects) => prevProjects.filter((proj) => proj._id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        projectDetails,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
