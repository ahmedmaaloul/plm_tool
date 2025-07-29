// src/pages/EditProject.js
import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ProjectDetailsForm from '../../components/project/ProjectDetailsForm';
import RolesManagement from '../../components/roles/RolesManagement';

// ICONS (add react-icons if not present)
import { FaProjectDiagram, FaUsers } from "react-icons/fa";
import styled from 'styled-components';

const Container = styled.div`
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #eaf1fb 0%, #f0f2f5 100%);
  padding: 48px 0 64px 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(66,103,178,0.11), 0 1.5px 5px rgba(66,103,178,0.06);
  width: 100%;
  max-width: 700px;
  padding: 40px 36px 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
`;

const Header = styled.h1`
  color: #4267B2;
  font-size: 2.1rem;
  letter-spacing: -1px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0.5rem;
`;

const Section = styled.section`
  background: #f8faff;
  border-radius: 14px;
  box-shadow: 0 1.5px 5px rgba(66,103,178,0.06);
  padding: 24px 22px 18px 22px;
  margin-bottom: 0px;
`;

const SectionTitle = styled.h2`
  color: #4267B2;
  font-size: 1.18rem;
  margin-bottom: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorMessage = styled.div`
  background: #ffe2e2;
  color: #ba1b1b;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1.05rem;
  margin-bottom: 18px;
  font-weight: 500;
  text-align: center;
`;

const EditProject = () => {
  const { projectDetails, fetchProjectById, updateProject } = useContext(ProjectContext);
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState({
    title: '',
    reference: null,
  });
  const [error, setError] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [assignedRoles, setAssignedRoles] = useState([]);
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [references, setReferences] = useState([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState('');

  const API_BASE_URL = 'http://localhost:5005';

  // Fetch project details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProjectById(projectId);
      } catch (err) {
        setError('Error fetching project details.');
      }
    };
    fetchData();
  }, [fetchProjectById, projectId]);

  // Update project data when projectDetails are fetched
  useEffect(() => {
    if (projectDetails && projectDetails.title && projectData.title === '') {
      setProjectData({
        title: projectDetails.title,
        reference: projectDetails.reference ? projectDetails.reference._id : null,
      });
      setSelectedReferenceId(projectDetails.reference ? projectDetails.reference._id : '');
      if (projectDetails.reference && projectDetails.reference.product) {
        setSelectedProductId(projectDetails.reference.product._id);
      }
    }
  }, [projectDetails]);

  // Fetch users excluding project creator
  useEffect(() => {
    if (projectDetails && projectDetails.creator) {
      const getUsers = async () => {
        try {
          const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const filteredUsers = usersResponse.data.users.filter(
            (u) => u._id !== projectDetails.creator
          );
          setUsers(filteredUsers);
        } catch (err) {
          setError('Error fetching users.');
        }
      };
      getUsers();
    }
  }, [projectDetails]);

  // Function to fetch roles
  const getRoles = async () => {
    try {
      const rolesResponse = await axios.get(
        `${API_BASE_URL}/api/roles/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const roles = rolesResponse.data.roles;
      // Separate assigned and unassigned roles
      const assignedRolesList = roles.filter((role) => role.user);
      const availableRolesList = roles
        .filter((role) => !role.user && role.name !== 'Project Creator')
        .map((role) => role.name);

      setAvailableRoles(availableRolesList);
      setAssignedRoles(assignedRolesList);
    } catch (err) {
      setError('Error fetching roles.');
    }
  };

  // Fetch roles when projectId is available
  useEffect(() => {
    if (projectId) {
      getRoles();
    }
  }, [projectId]);

  // Fetch products
  useEffect(() => {
    const getProducts = async () => {
      try {
        const productsResponse = await axios.get(`${API_BASE_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(productsResponse.data.products);
      } catch (err) {
        setError('Error fetching products.');
      }
    };
    getProducts();
  }, []);

  // Fetch references when a product is selected
  useEffect(() => {
    const getReferences = async () => {
      if (selectedProductId) {
        try {
          const referencesResponse = await axios.get(
            `${API_BASE_URL}/api/references?productId=${selectedProductId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          setReferences(referencesResponse.data.references);
        } catch (err) {
          setError('Error fetching references.');
        }
      } else {
        setReferences([]);
      }
    };
    getReferences();
  }, [selectedProductId]);

  const handleChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProjectData = {
        ...projectData,
        reference: selectedReferenceId || null,
      };
      await updateProject(projectId, updatedProjectData);
    } catch (err) {
      setError('Error updating project.');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleName) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/roles/assign`,
        {
          projectId,
          userId: selectedUserId,
          roleName: selectedRoleName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await getRoles();
      setSelectedUserId('');
      setSelectedRoleName('');
    } catch (err) {
      setError('Error assigning role.');
    }
  };

  const handleRemoveRole = async (userId, roleName) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/roles/remove`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          projectId,
          userId,
          roleName,
        },
      });
      await getRoles();
    } catch (err) {
      setError('Error removing role.');
    }
  };

  // Update handleAddRole to accept accessRights
  const handleAddRole = async (newRoleName, accessRights) => {
    if (!newRoleName || newRoleName === 'Project Creator') return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/roles/project/${projectId}`,
        {
          roleName: newRoleName,
          accessRights,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setAvailableRoles((prevRoles) => [...prevRoles, newRoleName]);
      await getRoles();
    } catch (err) {
      setError('Error adding role.');
    }
  };

  const assignedRolesToDisplay = assignedRoles.filter(
    (ar) => ar.user && ar.user._id !== projectDetails.creator
  );

  if (!projectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <Card>
        <Header>
          <FaProjectDiagram /> Edit Project
        </Header>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Section>
          <SectionTitle>
            <FaProjectDiagram /> Project Details
          </SectionTitle>
          <ProjectDetailsForm
            projectData={projectData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            products={products}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            references={references}
            selectedReferenceId={selectedReferenceId}
            setSelectedReferenceId={setSelectedReferenceId}
          />
        </Section>

        <Section>
          <SectionTitle>
            <FaUsers /> Roles Management
          </SectionTitle>
          <RolesManagement
            users={users}
            availableRoles={availableRoles}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            selectedRoleName={selectedRoleName}
            setSelectedRoleName={setSelectedRoleName}
            handleAssignRole={handleAssignRole}
            assignedRoles={assignedRolesToDisplay}
            handleRemoveRole={handleRemoveRole}
            handleAddRole={handleAddRole}
          />
        </Section>
      </Card>
    </Container>
  );
};

export default EditProject;
