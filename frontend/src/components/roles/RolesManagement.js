// src/components/RolesManagement.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUserPlus, FaUserShield, FaCheckSquare, FaPlusCircle,FaUserCircle, FaTrashAlt } from 'react-icons/fa';


// Add these styled components (put at the top of your file)
const RoleChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 7px;
`;

const RoleChip = styled.span`
  background: linear-gradient(90deg, #4267B2 60%, #6b93e7 100%);
  color: #fff;
  font-size: 0.95em;
  padding: 3px 13px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 1px 5px rgba(66,103,178,0.10);
  letter-spacing: 0.02em;
`;

const RoleItem = styled.li`
  background: #fff;
  border: 1.2px solid #dbe7fc;
  border-radius: 11px;
  padding: 17px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  font-size: 1.05rem;
  color: #34508c;
  box-shadow: 0 1px 8px rgba(66,103,178,0.06);
  transition: box-shadow 0.17s, transform 0.17s;
  position: relative;

  &:hover {
    box-shadow: 0 4px 18px rgba(66,103,178,0.13);
    transform: translateY(-2px) scale(1.01);
  }
`;

const RoleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const RoleUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  color: #4267B2;
  margin: 24px 0 12px 0;
  font-size: 1.28rem;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const Card = styled.div`
  background: #f5f9ff;
  border-radius: 12px;
  box-shadow: 0 2px 14px rgba(66,103,178,0.06);
  padding: 22px 24px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 550px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 6px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #4267B2;
  font-weight: 600;
  margin-bottom: 3px;
  font-size: 1.01rem;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const Input = styled.input`
  border: 1.3px solid #d6def7;
  background: #fff;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1.01rem;
  transition: border 0.18s;
  margin-bottom: 3px;
  &:focus {
    outline: none;
    border: 1.3px solid #4267B2;
    background: #fafdff;
  }
`;

const Select = styled.select`
  border: 1.3px solid #d6def7;
  background: #fff;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1.01rem;
  transition: border 0.18s;
  &:focus {
    outline: none;
    border: 1.3px solid #4267B2;
    background: #fafdff;
  }
`;

const Button = styled.button`
  margin-top: 6px;
  background: linear-gradient(90deg, #4267B2 0%, #6b93e7 100%);
  color: #fff;
  font-size: 1.09rem;
  font-weight: 600;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  box-shadow: 0 1px 8px rgba(66,103,178,0.08);
  transition: background 0.18s, box-shadow 0.18s;
  &:hover {
    background: linear-gradient(90deg, #35539a 0%, #5276bb 100%);
    box-shadow: 0 3px 18px rgba(66,103,178,0.10);
  }
`;

const CheckboxLabel = styled(Label)`
  font-weight: 500;
  color: #34508c;
  font-size: 1rem;
  margin: 0 0 0 5px;
`;

const Checkbox = styled.input`
  accent-color: #4267B2;
  margin-right: 7px;
  transform: scale(1.15);
`;

const RoleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;



const RemoveBtn = styled(Button)`
  background: #f2f2f2;
  color: #c93131;
  font-size: 1rem;
  box-shadow: none;
  padding: 8px 13px;
  &:hover {
    background: #ffeaea;
    color: #d10000;
  }
`;

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
      <SectionTitle>
        <FaUserPlus style={{ marginRight: 7 }} />
        Assign Roles
      </SectionTitle>
      <Card>
        <Form>
          <FormGroup>
            <Label>
              <FaUserShield /> Select User
            </Label>
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
            <Label>
              <FaCheckSquare /> Select Role
            </Label>
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
            <FaPlusCircle /> Assign Role
          </Button>
        </Form>
      </Card>

      <SectionTitle>
        <FaPlusCircle style={{ marginRight: 7 }} />
        Create New Role
      </SectionTitle>
      <Card>
        <Form>
          <FormGroup>
            <Label>Role Name</Label>
            <Input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
            />
          </FormGroup>
          <FormGroup>
            <Label>Access Rights</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {accessRightsOptions.map((right) => (
                <CheckboxLabel key={right}>
                  <Checkbox
                    type="checkbox"
                    value={right}
                    checked={newRoleAccessRights.includes(right)}
                    onChange={handleNewRoleAccessRightsChange}
                  />
                  {right}
                </CheckboxLabel>
              ))}
            </div>
          </FormGroup>
          <Button type="button" onClick={handleCreateRole}>
            <FaPlusCircle /> Create Role
          </Button>
        </Form>
      </Card>

      <SectionTitle>
        <FaUserShield style={{ marginRight: 7 }} />
        Assigned Roles
      </SectionTitle>
      <Card>
  <RoleList>
    {assignedRoles.map((role) => (
      <RoleItem key={`${role.user._id}-${role.name}`}>
        <RoleInfo>
          <RoleUserRow>
            <FaUserCircle size={22} color="#4267B2" />
            <span>
              <strong>{role.user.username}</strong>
              <span style={{ color: '#4267B2', margin: '0 6px', fontWeight: 500 }}>
                <FaUserShield size={13} style={{ marginBottom: -2, marginRight: 2 }} />
                {role.name}
              </span>
            </span>
          </RoleUserRow>
          <RoleChipGroup>
            {role.accessRights.map((right) => (
              <RoleChip key={right}>{right}</RoleChip>
            ))}
          </RoleChipGroup>
        </RoleInfo>
        <RemoveBtn
          type="button"
          onClick={() => handleRemoveRole(role.user._id, role.name)}
          title="Remove this role"
        >
          <FaTrashAlt />
        </RemoveBtn>
      </RoleItem>
    ))}
  </RoleList>
  {assignedRoles.length === 0 && (
    <span style={{ color: '#888', fontSize: '1rem' }}>No assigned roles yet.</span>
  )}
</Card>
    </div>
  );
};

export default RolesManagement;
