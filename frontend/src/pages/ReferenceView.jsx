import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import BOMDetails from "./bom/BOMDetails";

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
`;

const DocumentForm = styled.form`
margin-top 20px`;

const DocumentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

// Reference View Component
const ReferenceView = () => {
  const { id } = useParams(); // Get the reference ID from the URL
  const navigate = useNavigate();
  const [reference1, setReference1] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [version, setVersion] = useState(1);

  useEffect(() => {
    const fetchReferenceDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/references/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReference1(response.data); // Set the fetched reference data

        const docResponse = await axios.get(
          `http://localhost:5000/api/documents/reference/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDocuments(docResponse.data.documents);
      } catch (error) {
        console.error("Error fetching reference details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceDetails(); // Fetch reference details on component mount
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  const handleVersionChange = (e) => {
    setVersion(e.target.value);
  };

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDocuments(documents.filter((doc) => doc._id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob", // Important for downloading binary data
        }
      );

      // Create a temporary link to trigger the download
      const blob = new Blob([response.data], { type: response.data.type });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = response.data.name || "downloaded_file"; // Use the filename from the response
      link.click();
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("version_string", Number(version));
    formData.append("referenceId", id);

    // Convert file to base64 and append to the form data
    const base64Data = await convertFileToBase64(file);
    formData.append("data", base64Data); // Send base64 encoded string

    try {
      await axios.post(`http://localhost:5000/api/documents`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json", // Change based on your server's expected content type
        },
      });
      // Refresh the document list after submission
      const docResponse = await axios.get(
        `http://localhost:5000/api/documents/reference/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDocuments(docResponse.data.documents);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  if (!reference1) {
    return <div>Reference not found</div>; // Handle case where reference is not found
  }

  const { reference } = reference1;

  const handleViewBOMDetails = () => {
    navigate(`/boms/${reference.bom._id}`);
  };

  return (
    <Container>
      <h1>{console.log(reference)}</h1>
      <h1>Reference Details</h1>
      <h2>Associated Product: {reference.product.name}</h2>
      <h2>Reference code: {reference.code}</h2> {/* Display the product name */}
      <Button onClick={handleViewBOMDetails}>View BOM Details</Button>
      <DocumentForm onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <input
          type="text"
          placeholder="Document Type"
          value={documentType}
          onChange={handleDocumentTypeChange}
          required
        />
        <input
          type="number"
          placeholder="Version"
          value={version}
          onChange={handleVersionChange}
          required
        />
        <Button type="submit">Upload Document</Button>
      </DocumentForm>
      <h3>Documents:</h3>
      <DocumentList>
        {documents.map((doc) => (
          <li key={doc._id}>
            {doc.filename} - Version: {doc.version}
            <Button onClick={() => handleDownload(doc._id)}>Download</Button>
            <Button onClick={() => handleDelete(doc._id)}>Delete</Button>
          </li>
        ))}
      </DocumentList>
      <Button onClick={() => navigate(-1)}>Back</Button>{" "}
      {/* Button to go back */}
    </Container>
  );
};

export default ReferenceView;
