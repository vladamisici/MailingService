'use client';

export default function ReadmeTab() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Documentation
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          View and edit the project documentation in Markdown format.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-2">
          📚 Documentation Available
        </h4>
        <p className="text-green-800 dark:text-green-300 mb-4">
          Complete documentation is available in the project README.md file. 
          This includes setup instructions, API documentation, and troubleshooting guides.
        </p>
        <p className="text-green-700 dark:text-green-400 text-sm">
          README editing functionality will be available in future updates.
        </p>
      </div>
    </div>
  );
}
