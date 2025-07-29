// src/pages/ProjectsList.js
import React, { useEffect, useContext, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaFolderOpen } from 'react-icons/fa';

const Container = styled.div`
  padding: 40px 2vw;
  background: linear-gradient(120deg, #f0f4ff 60%, #d9e7fa 100%);
  min-height: calc(100vh - 60px);
`;

const Title = styled.h2`
  color: #4267B2;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: 1px;
  font-weight: 800;
  font-size: 2.2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 380px;
  padding: 13px 18px;
  margin: 0 auto 24px;
  display: block;
  border: none;
  border-radius: 40px;
  background: #e9efff;
  font-size: 1rem;
  color: #4267B2;
  box-shadow: 0 2px 18px 0 #d7e4fa2c;

  &:focus {
    outline: none;
    background: #d9e7fa;
    color: #3758a5;
  }
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #4267B2 80%, #3d5995 100%);
  color: #fff;
  padding: 13px 26px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 4px 18px 0 #4267b220;
  margin: 0 auto 36px;
  border: none;
  transition: transform 0.13s, box-shadow 0.18s, background 0.22s;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: linear-gradient(90deg, #3758a5 70%, #27407b 100%);
    transform: translateY(-2px) scale(1.035);
    box-shadow: 0 6px 22px 0 #4267b22a;
  }
`;

const gridAppear = keyframes`
  0% { opacity: 0; transform: translateY(30px) scale(.96);}
  100% { opacity: 1; transform: none;}
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 28px;
  margin-bottom: 24px;
  animation: ${gridAppear} 0.75s cubic-bezier(.19,1,.22,1);
`;

const ProjectCard = styled.div`
  background: rgba(255,255,255,0.78);
  border-radius: 22px;
  box-shadow: 0 8px 32px 0 #4267b211;
  border: 1px solid #e6eafd;
  padding: 30px 24px 22px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 155px;
  transition: transform 0.15s, box-shadow 0.19s, border 0.14s;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(1.5px);

  &:hover {
    transform: translateY(-6px) scale(1.025);
    box-shadow: 0 16px 36px 0 #4267b218;
    border: 1.5px solid #4267B2;
  }
`;

const ProjectTitle = styled.h3`
  color: #3758a5;
  margin-bottom: 8px;
  font-size: 1.23rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
`;

const ProjectReference = styled.p`
  color: #4267B2;
  opacity: 0.8;
  margin-bottom: 18px;
  font-size: 1rem;
  letter-spacing: .04em;
  font-weight: 500;
`;

const DetailsButton = styled(Link)`
  margin-top: auto;
  background: #4267B2;
  color: #fff;
  padding: 9px 22px;
  border-radius: 22px;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.2s, transform 0.14s;
  text-decoration: none;
  box-shadow: 0 2px 10px #4267b21a;

  &:hover {
    background: #3758a5;
    transform: translateY(-2px) scale(1.06);
  }
`;

const NoProjects = styled.div`
  text-align: center;
  color: #4267B2;
  font-size: 1.25rem;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: .88;
`;

const NoProjectIcon = styled(FaFolderOpen)`
  font-size: 3.7rem;
  margin-bottom: 12px;
  color: #b2c7ef;
`;

const ProjectsList = () => {
  const { projects, fetchProjects } = useContext(ProjectContext);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getProjects = async () => {
      try {
        await fetchProjects();
      } catch (err) {
        setError('Error fetching projects.');
      }
    };
    getProjects();
  }, [fetchProjects]);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Title>Your Projects</Title>
      {error && <p>{error}</p>}

      <SearchBar
        type="text"
        placeholder="🔍 Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ textAlign: 'center' }}>
        <CreateButton to="/projects/create">
          <FaPlus style={{ marginRight: 4, fontSize: "1.18em" }} />
          Create Project
        </CreateButton>
      </div>

      {filteredProjects.length === 0 ? (
        <NoProjects>
          <NoProjectIcon />
          <p>No projects found.</p>
        </NoProjects>
      ) : (
        <ProjectsGrid>
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id}>
              <ProjectTitle title={project.title}>{project.title}</ProjectTitle>
              <ProjectReference>
                Reference: {project.reference?.code || <span style={{ color: "#aaa" }}>—</span>}
              </ProjectReference>
              <DetailsButton to={`/projects/${project._id}`}>View Details</DetailsButton>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      )}
    </Container>
  );
};

export default ProjectsList;
