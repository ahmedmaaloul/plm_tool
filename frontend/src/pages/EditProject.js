// src/pages/EditProject.js
import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  FormWrapper,
  FormTitle,
  FormSection,
  SectionTitle,
  ErrorMessage,
} from '../components/StyledComponents';
import ProjectDetailsForm from '../components/ProjectDetailsForm';
import RolesManagement from '../components/RolesManagement';

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

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch project details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProjectById(projectId);
      } catch (err) {
        console.error(err);
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
          console.error(err);
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
      console.error(err);
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
        console.error(err);
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
          console.error(err);
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

      // Since the role is now assigned, we need to refetch roles
      await getRoles();

      // Clear selections
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

      // Since the role is now unassigned, we need to refetch roles
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
          accessRights, // Include accessRights
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Add new role to available roles
      setAvailableRoles((prevRoles) => [...prevRoles, newRoleName]);

      // Refetch roles to update assignedRoles with accessRights
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
      <FormWrapper>
        <FormTitle>Edit Project</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormSection>
          <SectionTitle>Project Details</SectionTitle>
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
        </FormSection>

        <FormSection>
          <SectionTitle>Roles Management</SectionTitle>
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
        </FormSection>
      </FormWrapper>
    </Container>
  );
};

export default EditProject;
