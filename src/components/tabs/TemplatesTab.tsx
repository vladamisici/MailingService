'use client';

export default function TemplatesTab() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Email Templates
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create and customize email templates with variable substitution.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
          🚧 Under Development
        </h4>
        <p className="text-blue-800 dark:text-blue-300">
          Template editing functionality will be available in the next update. 
          Currently, you can use the predefined templates in the Template tab.
        </p>
      </div>
    </div>
  );
}
