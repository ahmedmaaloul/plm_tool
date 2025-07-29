// src/pages/UserTasks.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled from 'styled-components';
// Styled components
const PageContainer = styled.div`
  padding: 40px;
  background: linear-gradient(135deg, #4267B2, #d0dbf7);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TaskContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const TaskList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TaskItem = styled.li`
  background-color: #f0f4ff;
  border: 1px solid #4267B2;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`;

const TaskDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusSelect = styled.select`
  padding: 8px;
  border-radius: 5px;
  background-color: #4267B2;
  color: #fff;
  border: none;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #3758a5;
  }
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: bold;
`;

const ProjectTitle = styled.h3`
  color: #4267B2;
  margin-bottom: 10px;
  font-size: 1.5rem;
  font-weight: bold;
`;

const TaskDescription = styled.p`
  font-size: 1rem;
  margin: 5px 0;
  color: #333;
`;

const TaskStatus = styled.p`
  font-size: 0.9rem;
  color: #555;
`;

const EmptyMessage = styled.p`
  font-size: 1.2rem;
  color: #fff;
  margin-top: 20px;
`;

// Main component
const UserTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasksByProject, setTasksByProject] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Group tasks by project
        const tasks = response.data.tasks;
        const groupedTasks = tasks.reduce((acc, task) => {
          const projectTitle = task.workflowStep.workflow.project.title;
          if (!acc[projectTitle]) {
            acc[projectTitle] = [];
          }
          acc[projectTitle].push(task);
          return acc;
        }, {});
        setTasksByProject(groupedTasks);
      } catch (err) {
        setError('Error fetching tasks');
      }
    };
    fetchTasks();
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5005/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Refetch tasks after status change
      setTasksByProject((prevState) => {
        const updatedTasks = { ...prevState };
        for (const project in updatedTasks) {
          updatedTasks[project] = updatedTasks[project].map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          );
        }
        return updatedTasks;
      });
    } catch (err) {
      setError('Error updating task status');
    }
  };

  return (
    <PageContainer>
      <Title>Your Tasks</Title>
      {error && <p>{error}</p>}

      {Object.keys(tasksByProject).length > 0 ? (
        Object.entries(tasksByProject).map(([projectTitle, tasks]) => (
          <TaskContainer key={projectTitle}>
            <ProjectTitle>{projectTitle}</ProjectTitle>
            <TaskList>
              {tasks.map((task) => (
                <TaskItem key={task._id}>
                  <TaskDetails>
                    <TaskDescription>{task.description}</TaskDescription>
                    <TaskStatus>Status: {task.status}</TaskStatus>
                  </TaskDetails>
                  <StatusSelect
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </StatusSelect>
                </TaskItem>
              ))}
            </TaskList>
          </TaskContainer>
        ))
      ) : (
        <EmptyMessage>No tasks available. Enjoy your free time!</EmptyMessage>
      )}
    </PageContainer>
  );
};

export default UserTasks;
