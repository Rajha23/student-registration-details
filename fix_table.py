import re

with open("src/pages/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Remove whitespace-nowrap from sticky columns
content = content.replace("whitespace-nowrap sticky right-0", "sticky right-0")

# 2. Add truncate to email
content = re.sub(
    r'className="(px-2 py-3 text-xs md:text-sm text-text-secondary)"(>\{student\.email\}</td>)',
    r'className="\1 max-w-[120px] truncate" title={student.email}\2',
    content
)

# 3. Add truncate to programme
content = re.sub(
    r'className="(px-2 py-3 text-xs md:text-sm)"(>\{student\.programme \|\| \'\-\'\}</td>)',
    r'className="\1 max-w-[150px] truncate" title={student.programme || \'\'}\2',
    content
)

# 4. Wrap action buttons in flex container
# Find all occurrences of the actions td
pattern = r'(<td className="px-2 py-3 text-xs md:text-sm text-right sticky right-0 bg-\[\#111827\] z-10 border-l border-white/5 shadow-\[-10px_0_15px_-5px_rgba\(0,0,0,0\.3\)\]">)\n([\s\S]*?)(</td>)'

def replacer(match):
    prefix = match.group(1)
    inner = match.group(2)
    suffix = match.group(3)
    
    # Check if we already wrapped it to prevent double-wrapping
    if "flex flex-wrap" not in inner:
        new_inner = f'\n                      <div className="flex flex-wrap justify-end gap-1 max-w-[120px] ml-auto">\n{inner}\n                      </div>\n                    '
        return prefix + new_inner + suffix
    return match.group(0)

content = re.sub(pattern, replacer, content)

# 5. Remove mr-2 from buttons inside the file
content = content.replace(" mr-2", "")

with open("src/pages/AdminDashboard.tsx", "w") as f:
    f.write(content)
