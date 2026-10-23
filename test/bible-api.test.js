/**
 * Automated Test Suite for Bible Server & API Endpoints
 */

const http = require('http');
const { server } = require('../server');

const TEST_PORT = 3199;

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${TEST_PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('       RUNNING BIBLE API AUTOMATED TESTS            ');
  console.log('====================================================');

  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`[TEST SERVER] Started on http://localhost:${TEST_PORT}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Books List
    console.log('\n--- Test 1: GET /api/bible/books ---');
    const booksRes = await request('/api/bible/books');
    assert(booksRes.status === 200, 'Status is 200');
    assert(Array.isArray(booksRes.body) && booksRes.body.length === 66, 'Returns 66 canonical books');
    assert(booksRes.body[0].slug === 'genesis', 'First book is Genesis');
    assert(booksRes.body[65].slug === 'revelation', 'Last book is Revelation');

    // 2. Genesis 1 in KJV
    console.log('\n--- Test 2: Genesis 1 in English KJV ---');
    const kjvGenRes = await request('/api/bible/chapter?translation=kjv&book=genesis&chapter=1');
    assert(kjvGenRes.status === 200, 'Status is 200');
    assert(kjvGenRes.body.versesCount === 31, 'Genesis 1 has 31 verses');
    assert(kjvGenRes.body.verses[0].text === 'In the beginning God created the heaven and the earth.', 'Genesis 1:1 text verified in KJV');

    // 3. Genesis 1 in Telugu
    console.log('\n--- Test 3: Genesis 1 in Telugu ---');
    const telGenRes = await request('/api/bible/chapter?translation=telugu&book=genesis&chapter=1');
    assert(telGenRes.status === 200, 'Status is 200');
    assert(telGenRes.body.versesCount === 31, 'Genesis 1 has 31 verses in Telugu');
    assert(telGenRes.body.verses[0].text === 'ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను.', 'Genesis 1:1 text verified in Telugu');

    // 4. John 3 in KJV
    console.log('\n--- Test 4: John 3 in English KJV ---');
    const kjvJohnRes = await request('/api/bible/chapter?translation=kjv&book=john&chapter=3');
    assert(kjvJohnRes.status === 200, 'Status is 200');
    const kjvV16 = kjvJohnRes.body.verses.find(v => v.verse === '16');
    assert(kjvV16 && kjvV16.text.includes('For God so loved the world'), 'John 3:16 text verified in KJV');

    // 5. John 3 in Telugu
    console.log('\n--- Test 5: John 3 in Telugu ---');
    const telJohnRes = await request('/api/bible/chapter?translation=telugu&book=john&chapter=3');
    assert(telJohnRes.status === 200, 'Status is 200');
    const telV16 = telJohnRes.body.verses.find(v => v.verse === '16');
    assert(telV16 && telV16.text.includes('దేవుడు లోకమును ఎంతో ప్రేమించెను'), 'John 3:16 text verified in Telugu');

    // 6. Navigation: Next and Previous book boundaries
    console.log('\n--- Test 6: Book and Chapter Boundaries ---');
    const invBook = await request('/api/bible/chapter?translation=kjv&book=NonExistent&chapter=1');
    assert(invBook.status === 404, 'Invalid book returns 404');
    assert(invBook.body.error.includes('not found'), 'Invalid book returns descriptive error');

    const invCh = await request('/api/bible/chapter?translation=kjv&book=genesis&chapter=51');
    assert(invCh.status === 400, 'Invalid chapter 51 returns 400');
    assert(invCh.body.validRange && invCh.body.validRange.max === 50, 'Invalid chapter provides validRange max: 50');

    const invTrans = await request('/api/bible/chapter?translation=latin&book=genesis&chapter=1');
    assert(invTrans.status === 400, 'Invalid translation returns 400');

    // 7. Search for known English word
    console.log('\n--- Test 7: Search English KJV for "salvation" ---');
    const searchKjv = await request('/api/bible/search?q=salvation&translation=kjv&limit=5');
    assert(searchKjv.status === 200, 'Search status is 200');
    assert(searchKjv.body.results.length > 0, `Found ${searchKjv.body.results.length} matches for "salvation"`);
    assert(searchKjv.body.results[0].text.toLowerCase().includes('salvation'), 'First result contains "salvation"');

    // 8. Search for known Telugu word
    console.log('\n--- Test 8: Search Telugu for "ప్రేమ" (Love) ---');
    const searchTel = await request('/api/bible/search?q=' + encodeURIComponent('ప్రేమ') + '&translation=telugu&limit=5');
    assert(searchTel.status === 200, 'Telugu search status is 200');
    assert(searchTel.body.results.length > 0, `Found ${searchTel.body.results.length} matches for "ప్రేమ"`);
    assert(searchTel.body.results[0].text.includes('ప్రేమ'), 'First result contains "ప్రేమ"');

    // 9. Search nonexistent word
    console.log('\n--- Test 9: Search nonexistent term ---');
    const emptySearch = await request('/api/bible/search?q=xyznonexistentterm999&translation=kjv');
    assert(emptySearch.status === 200, 'Empty search status is 200');
    assert(emptySearch.body.total === 0 && emptySearch.body.results.length === 0, 'Returns 0 results for nonexistent term');

    // 10. Daily verse
    console.log('\n--- Test 10: Daily Verse Endpoint ---');
    const dailyRes = await request('/api/bible/daily-verse');
    assert(dailyRes.status === 200, 'Daily verse status is 200');
    assert(dailyRes.body.referenceEn && dailyRes.body.kjvText, 'Daily verse has English ref and text');
    assert(dailyRes.body.referenceTe && dailyRes.body.teluguText, 'Daily verse has Telugu ref and text');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`BIBLE API TESTS FINISHED: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
