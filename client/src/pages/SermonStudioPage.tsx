export default function SermonStudioPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            AI-Powered Sermon Creation Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transform your sermon preparation with intelligent research, outline generation, and content enhancement
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            🚧 This page is currently under maintenance. The sermon creation studio is being updated to fix some technical issues.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Biblical Research</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate comprehensive biblical commentary and historical context for your sermons.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm text-gray-600 dark:text-gray-400">
              Coming soon...
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Sermon Outlining</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create structured, engaging sermon outlines with AI assistance.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm text-gray-600 dark:text-gray-400">
              Coming soon...
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Content Enhancement</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enhance your sermons with illustrations, stories, and practical applications.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm text-gray-600 dark:text-gray-400">
              Coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}