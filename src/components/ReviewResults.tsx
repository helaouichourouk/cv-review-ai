const ReviewResults = ({ results }: { results: any }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Résultats de l'analyse :</h3>
        <pre className="bg-gray-100 p-4 rounded-lg">{JSON.stringify(results, null, 2)}</pre>
    </div>
);

export default ReviewResults;
