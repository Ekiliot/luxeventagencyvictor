import base64
with open('e:/victorssite/public/scallop.svg', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')
data_uri = f"url('data:image/svg+xml;base64,{b64}')"

with open('e:/victorssite/src/components/About.module.css', 'r') as f:
    css = f.read()

css = css.replace("url('/scallop.svg')", data_uri)

with open('e:/victorssite/src/components/About.module.css', 'w') as f:
    f.write(css)
