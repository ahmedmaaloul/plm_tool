import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #ff5757;
  color: white;
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
`;

const SearchBar = styled.input`
  padding: 10px;
  width: 300px;
  margin-bottom: 20px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff7eb;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
`;

const Input = styled.input`
  padding: 8px;
  margin: 10px 0;
  width: 100%;
`;

const Select = styled.select`
  padding: 8px;
  margin: 10px 0;
  width: 100%;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #ff5757;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

// Reference Dashboard Component
const ReferenceDashboard = () => {
  const navigate = useNavigate(); 
  const [references, setReferences] = useState([]);
  const [filteredReferences, setFilteredReferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReference, setCurrentReference] = useState(null);
  const [formData, setFormData] = useState({ code: "", description: "", product_id: "" });
  const [products, setProducts] = useState([]);

  const API_BASE_URL = "http://localhost:5000"; // Adjust as necessary

  useEffect(() => {
    fetchReferences();
    fetchProducts(); // Fetch products on component mount
  }, []);

  // Fetch references from the server
  const fetchReferences = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/references`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReferences(response.data.references);
      setFilteredReferences(response.data.references);
    } catch (err) {
      console.error("Error fetching references:", err);
    }
  };

  // Fetch products from the server
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(response.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Filter references based on search term
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredReferences(
      references.filter((reference) =>
        reference.code.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Handle Add/Edit Reference Modal
  const handleModal = (isEdit = false, reference = null) => {
    setIsEditMode(isEdit);
    if (isEdit && reference) {
      setCurrentReference(reference);
      setFormData({ 
        code: reference.code, 
        description: reference.description, 
        product_id: reference.product._id 
      });
    } else {
      setFormData({ code: "", description: "", product_id: "" });
    }
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentReference(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new reference
  const addReference = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/references`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchReferences();
      closeModal();
    } catch (err) {
      console.error("Error adding reference:", err);
    }
  };

  // Update an existing reference
  const updateReference = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/references/${currentReference._id}`,
        { ...formData, product: formData.product_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchReferences();
      closeModal();
    } catch (err) {
      console.error("Error updating reference:", err);
    }
  };

  // Delete a reference
  const deleteReference = async (referenceId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/references/${referenceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchReferences();
    } catch (err) {
      console.error("Error deleting reference:", err);
    }
  };

  return (
    <Container>
      <h1>References Dashboard</h1>
      <Button onClick={() => handleModal(false)}>Add Reference</Button>
      <SearchBar
        type="text"
        placeholder="Search references by code"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Table>
        <thead>
          <tr>
            <Th>Code</Th>
            <Th>Description</Th>
            <Th>Product Id</Th>
            <Th>Product Name</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredReferences.length > 0 ? (
            filteredReferences.map((reference) => (
              <tr key={reference._id}>
                <Td>{reference.code}</Td>
                <Td>{reference.description}</Td>
                <Td>{reference.product._id}</Td>
                <Td>{reference.product.name}</Td>
                <Td>
                  <Button onClick={() => handleModal(true, reference)}>
                    Edit
                  </Button>
                  <Button onClick={() => deleteReference(reference._id)}>
                    Delete
                  </Button>
                  <Button
                    onClick={() => navigate(`/products/${reference._id}`)}
                  >
                    View
                  </Button>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="5">No references found</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Reference Modal */}
      
      {showModal && (
  <ModalOverlay>
    <ModalContent>
      <CloseButton onClick={closeModal}>&times;</CloseButton>
      <h3>{isEditMode ? "Edit Reference" : "Add Reference"}</h3>
      <div>
        <label>Code:</label>
        <Input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Description:</label>
        <Input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Product:</label>
        <Select
          value={formData.product_id
          }
          onChange={(e) => setFormData({...formData, product_id: e.target.value})}
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={isEditMode ? updateReference : addReference}>
        {isEditMode ? "Update Reference" : "Add Reference"}
      </Button>
    </ModalContent>
  </ModalOverlay>
)}
    </Container>
  );
};

export default ReferenceDashboard;
