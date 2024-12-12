import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { StlViewer } from "react-stl-viewer";
import { Buffer } from "buffer";
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
  const [previewFile, setPreviewFile] = useState(null);

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

  useEffect(() => {
    console.log("previewFile updated:", previewFile);
  }, [previewFile]); // This will run whenever previewFile changes

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleVersionChange = (e) => {
    setVersion(e.target.value);
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this file?"))
      try {
        await axios.delete(
          `http://localhost:5000/api/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDocuments(documents.filter((doc) => doc._id !== documentId));
      } catch (error) {
        console.error("Error deleting document:", error);
      }
  };

  const handleDownload = async (documentId) => {
    if (window.confirm("Are you sure you want to download this file?"))
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

        const contentDisposition = response.headers["content-disposition"];

        let filename = "downloaded_file";
        if (contentDisposition) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        // Create a temporary link to trigger the download
        const blob = new Blob([response.data], {
          type: response.data.type,
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || "downloaded_file"; // Use the filename from the response
        link.click();
      } catch (error) {
        console.error("Error downloading document:", error);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("documentType", documentType);
    formData.append("version_string", Number(version));
    formData.append("referenceId", id);
    formData.append("file", file);

    try {
      await axios.post(`http://localhost:5000/api/documents`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data", // Change based on your server's expected content type
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

  const stlViewerStyle = {
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
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

  const handlePreview = (fileBuffer) => {
    // Convert the buffer to a Blob
    const blob = new Blob([Buffer.from(fileBuffer.data)], {
      type: "application/sla",
    });

    // Create a URL for the Blob
    const previewUrl = URL.createObjectURL(blob);

    // Set the preview file URL
    setPreviewFile(previewUrl);

    // Optionally log the URL for debugging purposes
    console.log("Preview URL:", previewUrl);
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
          type="number"
          placeholder="Version"
          value={version}
          onChange={handleVersionChange}
          required
        />
        <Button type="submit">Upload Document</Button>
      </DocumentForm>
      <h3>Documents:</h3>
      {previewFile && (
        <StlViewer
          style={stlViewerStyle}
          orbitControls
          shadows
          url={previewFile}
        />
      )}
      <DocumentList>
        {documents.map((doc) => (
          <li key={doc._id}>
            {doc.filename} - Version: {doc.version}
            {doc.documentType === "model/stl" && (
              <Button onClick={() => handlePreview(doc.file)}>Preview</Button>
            )}
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
