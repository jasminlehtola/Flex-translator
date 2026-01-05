import re

def latex_to_markdown(latex_str):
    label_dict = {}
    preserve_dict = {}
    
    # Preserve LaTeX comments, tabular, and any other environments you want to keep unchanged
    preserve_envs = [
        (r'(%.*?)(?=\n|\Z)', 'COMMENT'),
        (r'\\begin\{tabular\}.*?\\end\{tabular\}', 'TABULAR')
        # Add more here
    ]
    
    for i, (pattern, tag) in enumerate(preserve_envs):
        envs = re.findall(pattern, latex_str, re.DOTALL)
        for j, env in enumerate(envs):
            env_key = f"<!-- {tag}-{i}-{j} -->"
            latex_str = latex_str.replace(env, env_key, 1)
            preserve_dict[env_key] = env
    
    # Convert sections, subsections, and subsubsections
    def convert_headings(match):
        heading_type = {
            'section': '#',
            'subsection': '##',
            'subsubsection': '###'
        }.get(match.group(1), '')
        
        title = match.group(2)
        label = match.group(4)
        
        if label:
            label_dict[title] = label
            
        return f"{heading_type} {title}"
    
    latex_str = re.sub(r'\\(section|subsection|subsubsection)\{(.*?)\}(\s*\\label\{(.*?)\})?', convert_headings, latex_str)
    
    # Convert itemized lists, but avoid converting tabular environment
    itemized_content = re.findall(r'\\begin\{itemize\}(.*?)\\end\{itemize\}', latex_str, re.DOTALL)
    for content in itemized_content:
        bullet_list = re.sub(r'\\item', r'-', content).strip()
        bullet_list = bullet_list.replace("\t", "") # Remove the tabs inside itemize
        bullet_list = re.sub(r'(^|\n)\s+', r'\1', bullet_list) # Remove the spaces inside itemize 
        latex_str = latex_str.replace(f'\\begin{{itemize}}{content}\\end{{itemize}}', f"{bullet_list}\n")

    # Convert enumerated lists
    enumerated_content = re.findall(r'\\begin\{enumerate\}(.*?)\\end\{enumerate\}', latex_str, re.DOTALL)
    for content in enumerated_content:
        ordered_list = re.sub(r'\\item', r'1.', content).strip()
        ordered_list = ordered_list.replace("\t", "") # Remove the tabs inside itemize
        ordered_list = re.sub(r'(^|\n)\s+', r'\1', ordered_list) # Remove the spaces inside itemize 
        latex_str = latex_str.replace(f'\\begin{{enumerate}}{content}\\end{{enumerate}}', f"{ordered_list}\n")
    
    # Restore preserved environments
    for env_key, env_value in preserve_dict.items():
        latex_str = latex_str.replace(env_key, env_value)
    return latex_str, label_dict

def markdown_to_latex(markdown_str, label_dict):
    comment_dict = {}
    preserve_dict = {}
    
    # Preserve Markdown comments and any other blocks you want to keep unchanged
    preserve_blocks = [
        (r'<!-- COMMENT-.*? -->', 'COMMENT'),
        (r'<!-- TABULAR-.*? -->', 'TABULAR')
        # Add more here
    ]
    
    for i, (pattern, tag) in enumerate(preserve_blocks):
        blocks = re.findall(pattern, markdown_str)
        for j, block in enumerate(blocks):
            block_key = f"% {tag}-{i}-{j}"
            markdown_str = markdown_str.replace(block, block_key, 1)
            preserve_dict[block_key] = block


    # Convert headings
    def convert_headings_back(match):
        heading_type = {
            '#': 'section',
            '##': 'subsection',
            '###': 'subsubsection'
        }.get(match.group(1), '')
        
        title = match.group(2)
        label = label_dict.get(title, None)
        
        if label:
            return f"\\{heading_type}{{{title}}}\\label{{{label}}}"
        return f"\\{heading_type}{{{title}}}"
    
    markdown_str = re.sub(r'(#+) (.*?)\n', convert_headings_back, markdown_str)
    
    # Convert bullet lists to itemize
    bullet_lists = re.findall(r'(- .*?)(?=\n\n|\Z)', markdown_str, re.DOTALL)
    for list_content in bullet_lists:
        itemized_content = re.sub(r'- ', r'\\item ', list_content).strip()
        markdown_str = markdown_str.replace(list_content, f"\\begin{{itemize}}\n{itemized_content}\n\\end{{itemize}}")

    # Convert ordered lists to enumerate
    ordered_lists = re.findall(r'(1\. .*?)(?=\n\n|\Z)', markdown_str, re.DOTALL)
    for list_content in ordered_lists:
        enumerated_content = re.sub(r'1\. ', r'\\item ', list_content).strip()
        markdown_str = markdown_str.replace(list_content, f"\\begin{{enumerate}}\n{enumerated_content}\n\\end{{enumerate}}")
    
    # Restore preserved blocks
    for block_key, block_value in preserve_dict.items():
        markdown_str = markdown_str.replace(block_key, block_value[4:-3].strip())
    return markdown_str

# Example usage
latex_str = r'''
% This is a comment

\section{Introduction} \label{intro}

This is introduction.

% Another comment

\subsection{Background}\label{background}

This is background.

\begin{itemize}
    \item First item
    \item Second item
\end{itemize}

\begin{enumerate}
    \item Enumerated first
    \item Enumerated second
\end{enumerate}
'''

test_2 =r'''


\begin{tabular}{ll}
Esiintymistaidot & Projektinhallintataidot \\
Luovuus & Tieto- ja viestintätekniikan taidot \\
Moniammatillisuus/tieteidenvälisyys & Verkostoitumistaidot \\
Ongelmanratkaisutaidot & Viestintätaidot \\
Organisointi- ja koordinointitaidot & Yhteistyö- ja neuvottelutaidot
\end{tabular}

\vspace{5mm}


'''
markdown_str, label_dict = latex_to_markdown(latex_str)
print("Markdown:")
print(markdown_str)
print("Labels:", label_dict)

latex_str_converted_back = markdown_to_latex(markdown_str, label_dict)
print("\nLaTeX Converted Back:")
print(latex_str_converted_back)
