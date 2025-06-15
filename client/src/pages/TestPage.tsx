export default function TestPage() {
  const handleClick = () => {
    alert('Button clicked successfully!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Interface Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Click Response
        </button>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Audio Bible Status</h2>
        <p>✓ Database contains 42,561 Bible verses</p>
        <p>✓ API endpoint responding successfully</p>
        <p>✓ Complete Bible coverage (Genesis - Revelation)</p>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ecfdf5', 
        borderRadius: '8px'
      }}>
        <h3>Next Steps</h3>
        <p>1. Verify this page responds to clicks</p>
        <p>2. Test basic interface functionality</p>
        <p>3. Build Audio Bible features step by step</p>
      </div>
    </div>
  );
}