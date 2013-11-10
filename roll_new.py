import argparse
import shutil
import os

parser = argparse.ArgumentParser(description='Roll a new playground.')
parser.add_argument('-n', action='store', dest='name', required=True)
parser.add_argument('-l', action='store', dest='libs', default='EJS|KEYDROWN|BOX2D')
parser.add_argument('-cw', action='store', dest='width', default=800, type=int)
parser.add_argument('-ch', action='store', dest='height', default=600, type=int)

args = parser.parse_args()
dest = os.path.join('.', args.name)

shutil.copytree('./000_base', dest)

index_html = os.path.join(dest, 'index.html')

with open(index_html) as f:
    contents = f.read()

lib_dict = {
    'EJS': '<script src="/libs/easeljs-0.7.0.min.js"></script>',
    'KEYDROWN': '<script src="/libs/keydrown.min.js"></script>',
    'BOX2D': '<script src="/libs/Box2dWeb-2.1.a.3.min.js"></script>',
}
libs = ""
for l in args.libs.upper().split('|'):
    libs = libs + lib_dict[l]

contents = contents.replace(r'<% CANVAS_WIDTH %>', str(args.width))
contents = contents.replace(r'<% CANVAS_HEIGHT %>', str(args.height))
contents = contents.replace(r'<% LIBS %>', libs)

with open(index_html, 'w') as f:
    f.write(contents)

with open('./index.html') as f:
    contents = f.read()

contents = contents.replace('</ul>', '<li><a href="/{0}/index.html">{0}</a></li></ul>'.format(args.name))
with open('./index.html', 'w') as f:
    f.write(contents)
