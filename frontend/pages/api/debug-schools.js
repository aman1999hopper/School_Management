// Debug version of schools API to identify issues
import { getConnection, testConnection } from '../../lib/db';

export default async function handler(req, res) {
  console.log('🔍 Debug API called');
  console.log('Method:', req.method);
  
  try {
    // Step 1: Test basic response
    console.log('✅ Step 1: API endpoint is accessible');
    
    // Step 2: Test database connection
    console.log('🔍 Step 2: Testing database connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest) {
      console.log('❌ Database connection failed');
      return res.status(500).json({ 
        error: 'Database connection failed',
        step: 'connection_test',
        message: 'Cannot connect to PostgreSQL database'
      });
    }
    
    console.log('✅ Step 2: Database connection successful');
    
    // Step 3: Test database query
    console.log('🔍 Step 3: Testing database query...');
    try {
      const pool = await getConnection();
      const result = await pool.query('SELECT COUNT(*) as count FROM schools');
      console.log('✅ Step 3: Database query successful, school count:', result.rows[0].count);
    } catch (dbError) {
      console.log('❌ Step 3: Database query failed:', dbError.message);
      return res.status(500).json({
        error: 'Database query failed',
        step: 'database_query',
        message: dbError.message,
        details: dbError.stack
      });
    }
    
    // Step 4: Check if it's a POST request
    if (req.method === 'POST') {
      console.log('🔍 Step 4: Processing POST request...');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body:', req.body);
      
      // For debugging, let's try a simple insert without multer
      try {
        const pool = await getConnection();
        const testResult = await pool.query(
          'INSERT INTO schools (name, address, city, state, contact, email_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          ['Test School', 'Test Address', 'Test City', 'Test State', 1234567890, 'test@test.com']
        );
        
        console.log('✅ Step 4: Test insert successful, ID:', testResult.rows[0].id);
        
        return res.status(200).json({
          success: true,
          message: 'Debug test successful',
          testInsertId: testResult.rows[0].id,
          steps: ['API accessible', 'Database connected', 'Query successful', 'Insert successful']
        });
        
      } catch (insertError) {
        console.log('❌ Step 4: Insert failed:', insertError.message);
        return res.status(500).json({
          error: 'Insert failed',
          step: 'test_insert',
          message: insertError.message,
          details: insertError.stack
        });
      }
    }
    
    // GET request
    if (req.method === 'GET') {
      console.log('🔍 Processing GET request...');
      try {
        const pool = await getConnection();
        const result = await pool.query('SELECT * FROM schools ORDER BY created_at DESC LIMIT 5');
        
        return res.status(200).json({
          success: true,
          message: 'Debug GET successful',
          data: result.rows,
          count: result.rows.length
        });
        
      } catch (selectError) {
        console.log('❌ SELECT query failed:', selectError.message);
        return res.status(500).json({
          error: 'Select query failed',
          step: 'select_query',
          message: selectError.message,
          details: selectError.stack
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Debug API working',
      method: req.method
    });
    
  } catch (error) {
    console.error('❌ Debug API Error:', error);
    return res.status(500).json({
      error: 'Debug API failed',
      message: error.message,
      stack: error.stack
    });
  }
}