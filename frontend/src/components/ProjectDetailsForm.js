// src/components/ProjectDetailsForm.js
import React from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Select,
  SubmitButton,
} from './StyledComponents';

const ProjectDetailsForm = ({
  projectData,
  handleChange,
  handleSubmit,
  products,
  selectedProductId,
  setSelectedProductId,
  references,
  selectedReferenceId,
  setSelectedReferenceId,
}) => (
  <Form onSubmit={handleSubmit}>
    <FormGroup>
      <Label htmlFor="title">Title</Label>
      <Input
        type="text"
        id="title"
        name="title"
        value={projectData.title}
        onChange={handleChange}
        required
      />
    </FormGroup>

    <FormGroup>
      <Label>Select Product:</Label>
      <Select
        value={selectedProductId}
        onChange={(e) => {
          setSelectedProductId(e.target.value);
          setSelectedReferenceId('');
        }}
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </Select>
    </FormGroup>

    {references.length > 0 && (
      <FormGroup>
        <Label>Select Reference:</Label>
        <Select
          value={selectedReferenceId}
          onChange={(e) => setSelectedReferenceId(e.target.value)}
        >
          <option value="">Select Reference</option>
          {references.map((ref) => (
            <option key={ref._id} value={ref._id}>
              {ref.code}
            </option>
          ))}
        </Select>
      </FormGroup>
    )}

    <SubmitButton type="submit">Save Changes</SubmitButton>
  </Form>
);

export default ProjectDetailsForm;
