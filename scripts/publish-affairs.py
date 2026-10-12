"""Publish only the public current-affairs feed; requires authenticated gh."""
import base64, datetime, json, shutil, subprocess
from pathlib import Path
from urllib.parse import urlparse
root = Path(__file__).resolve().parents[1]
gh = shutil.which('gh') or '/opt/homebrew/bin/gh'
repo = 'repos/Niko-kang/shiguang-study'
def api(path, body=None):
    args = [gh, 'api', repo + path]
    if body is not None: args += ['--method', 'PUT', '--input', '-']
    return json.loads(subprocess.check_output(args, input=json.dumps(body) if body is not None else None, text=True, timeout=60))
def read(branch, path):
    result = api('/contents/' + path + '?ref=' + branch)
    return result, json.loads(base64.b64decode(result['content']))
feed = json.loads((root / 'public/data/current-affairs.json').read_text())
assert datetime.datetime.fromisoformat(feed['updatedAt']).tzinfo is not None
assert feed['editions']
dates = [e['date'] for e in feed['editions']]
assert len(dates) == len(set(dates))
for edition in feed['editions']:
    datetime.date.fromisoformat(edition['date'])
    assert isinstance(edition['intro'], str) and len(edition['stories']) <= 4
    for story in edition['stories']:
        for field in ['id','title','category','publishedAt','eventDate','summary','perspective','question','source','url']:
            assert isinstance(story[field], str) and story[field].strip(), field
        datetime.date.fromisoformat(story['publishedAt'])
        url = urlparse(story['url'])
        assert url.scheme == 'https' and url.hostname
        assert isinstance(story['hints'], list) and all(isinstance(s,str) for s in story['hints'])
meta, remote = read('main', 'public/data/current-affairs.json')
# Keep remote-only dates, including editions published by another editor.
editions = {e['date']: e for e in remote['editions']}
for edition in feed['editions']:
    if edition['date'] == max(dates) or edition['date'] not in editions:
        editions[edition['date']] = edition
feed['editions'] = sorted(editions.values(), key=lambda e:e['date'], reverse=True)
assert feed['updatedAt'] >= remote['updatedAt'], 'Fetch the latest feed before publishing'
content = (json.dumps(feed, ensure_ascii=False, indent=2) + '\n').encode()
for branch, path in [('main','public/data/current-affairs.json'),('gh-pages','data/current-affairs.json')]:
    current, existing = (meta, remote) if branch == 'main' else read(branch,path)
    if existing == feed:
        print(branch + ': already up to date'); continue
    result = api('/contents/' + path, {'message':'Update daily current affairs '+feed['editions'][0]['date'], 'branch':branch, 'sha':current['sha'], 'content':base64.b64encode(content).decode()})
    print(branch, result['commit']['sha'])
(root / 'public/data/current-affairs.json').write_bytes(content)
print('Wait for GitHub Pages deployment and verify the public feed before reporting success.')
