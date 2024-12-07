import { useState } from "react";
import UploadCV from "../components/UploadCV";
import ReviewResults from "../components/ReviewResults";
import axios from "axios";

// Utility function to handle retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Home = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    // Basic file validation (for example, checking for PDF or DOCX files)
    if (!file.type.includes("pdf") && !file.type.includes("docx")) {
      setError("Veuillez télécharger un fichier PDF ou DOCX.");
      return;
    }

    setLoading(true); // Start the spinner
    setError(null); // Clear any previous error
    setResults(null); // Clear previous results

    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result;

      const maxRetries = 3;
      let attempt = 0;
      let success = false;

      while (attempt < maxRetries && !success) {
        try {
          // POST request to analyze the file
          const response = await axios.post("/api/analyze", { fileContent });

          // Check if the response data structure is correct
          if (response.data && response.data.results) {
            setResults(response.data.results); // Update results if response is valid
            success = true;
          } else {
            setError("La réponse du serveur est invalide. Veuillez réessayer.");
            break;
          }
        } catch (err: any) {
          if (err.response) {
            if (err.response.status === 429) {
              // Retry logic for 429 - too many requests
              if (attempt < maxRetries - 1) {
                setError(`Trop de requêtes. Tentative ${attempt + 1} sur ${maxRetries}.`);
                const retryAfter = err.response.headers["retry-after"] || 2; // Default to 2 seconds if not provided
                await delay(retryAfter * 1000); // Wait before retrying
                attempt++;
              } else {
                setError("Trop de requêtes. Veuillez réessayer plus tard.");
                break;
              }
            } else if (err.response.status === 500) {
              setError("Erreur interne du serveur. Veuillez réessayer plus tard.");
              break;
            } else {
              setError("Une erreur s'est produite lors de l'analyse. Veuillez réessayer.");
              break;
            }
          } else {
            setError("Une erreur de connexion s'est produite. Veuillez vérifier votre connexion.");
            break;
          }
        }
      }

      setLoading(false); // Stop the spinner after retry attempts
    };

    // Read file as text
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold">Analyseur de CV avec IA</h1>
          <p className="mt-2 text-lg">Téléchargez votre CV pour une analyse détaillée instantanée.</p>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-semibold text-indigo-700">Téléchargez votre CV</h2>
          <UploadCV onUpload={handleUpload} />
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 text-red-800 p-4 rounded">
              <p>{error}</p>
            </div>
          )}
        </div>
        {results && (
          <div className="mt-8 bg-white p-8 rounded-xl shadow-lg">
            <ReviewResults results={results} />
          </div>
        )}
      </main>
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Analyseur de CV. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
