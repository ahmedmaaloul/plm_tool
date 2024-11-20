import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

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
  const canvasRef = useRef(null);

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

  const handlePreview = (stlFile) => {
    setPreviewFile(stlFile);
  };

  useEffect(() => {
    if (previewFile && previewFile.type === "model/stl") {
      loadSTLFile(previewFile);
    }
  }, [previewFile]);

  const loadSTLFile = (stlFile) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(500, 500); // Set size of the canvas
    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(light);

    // Add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    const loader = new STLLoader();
    loader.load(URL.createObjectURL(stlFile), (geometry) => {
      const material = new THREE.MeshBasicMaterial({ color: 0x0055ff });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      camera.position.z = 5;

      const animate = () => {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    });
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
            {doc.documentType === "model/stl" && (
              <Button onClick={() => handlePreview(doc.file)}>Preview</Button>
            )}
            <Button onClick={() => handleDownload(doc._id)}>Download</Button>
            <Button onClick={() => handleDelete(doc._id)}>Delete</Button>
          </li>
        ))}
      </DocumentList>
      <div ref={canvasRef} style={{ width: "500px", height: "500px" }}></div>
      <Button onClick={() => navigate(-1)}>Back</Button>{" "}
      {/* Button to go back */}
    </Container>
  );
};

export default ReferenceView;
