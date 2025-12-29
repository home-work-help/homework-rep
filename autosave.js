<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Copy JS Code</title>
  <style>
    button {
      margin: 10px 0;
      padding: 8px 16px;
      font-size: 16px;
      cursor: pointer;
    }
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>

<h2>autosave.js Code</h2>
<pre id="codeBlock">
// REPLACE with your keys
const SUPABASE_URL = 'https://qefqsfqvxuooxkkaeyfp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KdCUwZxoISYCDxnQb4qvJg_I_MnGN6J';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('leadForm');
const resumeLinkContainer = document.getElementById('resumeLink');
const resumeUrl = document.getElementById('resumeUrl');

// get resume token from URL
let params = new URLSearchParams(window.location.search);
let resumeToken = params.get('token') || null;

// fields to track
const fields = ['email', 'name', 'phone', 'message'];

// autosave every input change
fields.forEach(id => {
  document.getElementById(id).addEventListener('input', saveDraft);
});

async function saveDraft() {
  const data = {};
  fields.forEach(id => data[id] = document.getElementById(id).value);

  if (!resumeToken) {
    // first time save, create draft
    const { data: inserted, error } = await supabase
      .from('form_leads')
      .insert([{ data, status: 'draft' }])
      .select();
    if (error) return console.error(error);
    resumeToken = inserted[0].resume_token;
    showResumeLink();
  } else {
    // update existing draft
    const { error } = await supabase
      .from('form_leads')
      .update({ data })
      .eq('resume_token', resumeToken);
    if (error) console.error(error);
  }
}

function showResumeLink() {
  resumeLinkContainer.style.display = 'block';
  resumeUrl.href = `${window.location.origin}${window.location.pathname}?token=${resumeToken}`;
}

// on load, fetch existing draft if token exists
async function loadDraft() {
  if (!resumeToken) return;
  const { data: drafts, error } = await supabase
    .from('form_leads')
    .select('*')
    .eq('resume_token', resumeToken);
  if (error) return console.error(error);
  if (!drafts.length) return;

  const savedData = drafts[0].data;
  fields.forEach(id => document.getElementById(id).value = savedData[id] || '');
  showResumeLink();
}

loadDraft();

// final submit
form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {};
  fields.forEach(id => data[id] = document.getElementById(id).value);

  if (!resumeToken) {
    const { data: inserted, error } = await supabase
      .from('form_leads')
      .insert([{ data, status: 'submitted' }])
      .select();
    if (error) return console.error(error);
  } else {
    const { error } = await supabase
      .from('form_leads')
      .update({ data, status: 'submitted' })
      .eq('resume_token', resumeToken);
    if (error) return console.error(error);
  }

  alert('Form submitted!');  
});
</pre>

<button onclick="copyCode()">Copy Code</button>

<script>
function copyCode() {
  const code = document.getElementById('codeBlock').innerText;
  navigator.clipboard.writeText(code).then(() => {
    alert('Code copied to clipboard!');
  }, (err) => {
    console.error('Could not copy text: ', err);
  });
}
</script>

</body>
</html>
