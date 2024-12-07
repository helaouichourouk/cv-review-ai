import React, { useState } from "react";

const UploadCV = ({ onUpload }: { onUpload: (file: File) => void }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border">
            <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="w-full text-lg py-3 px-4 bg-white border-2 border-gray-300 rounded-lg"
            />
            {file && <p className="mt-4 text-gray-600">Fichier sélectionné : {file.name}</p>}
        </div>
    );
};

export default UploadCV;
