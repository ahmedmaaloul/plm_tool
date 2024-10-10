// src/components/RolesManagement.js
import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Select,
  Button,
} from '../StyledComponents';

const accessRightsOptions = [
  'Product',
  'CustomersAndRequirements',
  'BOMAndSuppliers',
  'Workflow',
];

const RolesManagement = ({
  users,
  availableRoles,
  selectedUserId,
  setSelectedUserId,
  selectedRoleName,
  setSelectedRoleName,
  handleAssignRole,
  assignedRoles,
  handleRemoveRole,
  handleAddRole,
}) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleAccessRights, setNewRoleAccessRights] = useState([]);

  const handleNewRoleAccessRightsChange = (e) => {
    const value = e.target.value;
    setNewRoleAccessRights((prev) =>
      prev.includes(value)
        ? prev.filter((right) => right !== value)
        : [...prev, value]
    );
  };

  const handleCreateRole = () => {
    if (!newRoleName || newRoleAccessRights.length === 0) return;
    handleAddRole(newRoleName, newRoleAccessRights);
    setNewRoleName('');
    setNewRoleAccessRights([]);
  };

  return (
    <div>
      <h3>Assign Roles</h3>
      <Form>
        <FormGroup>
          <Label>Select User:</Label>
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Select Role:</Label>
          <Select
            value={selectedRoleName}
            onChange={(e) => setSelectedRoleName(e.target.value)}
          >
            <option value="">Select Role</option>
            {availableRoles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </Select>
        </FormGroup>
        <Button type="button" onClick={handleAssignRole}>
          Assign Role
        </Button>
      </Form>

      <h3>Create New Role</h3>
      <Form>
        <FormGroup>
          <Label>Role Name:</Label>
          <Input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Access Rights:</Label>
          {accessRightsOptions.map((right) => (
            <div key={right}>
              <Input
                type="checkbox"
                value={right}
                checked={newRoleAccessRights.includes(right)}
                onChange={handleNewRoleAccessRightsChange}
              />
              <Label>{right}</Label>
            </div>
          ))}
        </FormGroup>
        <Button type="button" onClick={handleCreateRole}>
          Create Role
        </Button>
      </Form>

      <h3>Assigned Roles</h3>
      <ul>
        {assignedRoles.map((role) => (
          <li key={`${role.user._id}-${role.name}`}>
            {role.user.username} - {role.name} - Access Rights: {role.accessRights.join(', ')}
            <Button
              type="button"
              onClick={() => handleRemoveRole(role.user._id, role.name)}
            >
              Remove Role
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RolesManagement;
