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

// Customer Dashboard Component
const ProductDashboard = () => {
  const navigate = useNavigate(); 
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const API_BASE_URL = "http://localhost:5000"; // Adjust as necessary

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch customers from the server
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Filter customers based on search term
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Handle Add/Edit Customer Modal
  const handleModal = (isEdit = false, product = null) => {
    setIsEditMode(isEdit);
    if (isEdit && product) {
      setCurrentProduct(product);
      setFormData({ name: product.name, description: product.description });
    } else {
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new customer
  const addProduct = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/products`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Update an existing customer
  const updateProduct = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/products/${currentProduct._id}`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  // Delete a customer
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <Container>
      <h1>Products Dashboard</h1>
      <Button onClick={() => handleModal(false)}>Add Product</Button>
      <SearchBar
        type="text"
        placeholder="Search products by name"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id}>
                <Td>{product.name}</Td>
                <Td>{product.description}</Td>
                <Td>
                  <Button onClick={() => handleModal(true, product)}>
                    Edit
                  </Button>
                  <Button onClick={() => deleteProduct
            (product._id)}>
                    Delete
                  </Button>
                  <Button
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {" "}
                    {/* Redirect to Customer Details */}
                    View
                  </Button>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="3">No products found</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <h3>{isEditMode ? "Edit Product" : "Add Product"}</h3>
            <div>
              <label>Name:</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
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
            <Button onClick={isEditMode ? updateProduct : addProduct}>
              {isEditMode ? "Update Product" : "Add Product"}
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ProductDashboard;
