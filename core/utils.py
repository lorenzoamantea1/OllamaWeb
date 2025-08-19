import markdown
from bs4 import BeautifulSoup

def convert_markdown(text):
    extensions = ["fenced_code", "codehilite", "tables"]
    base_text = None
    if "<think>" in text:
        base_text, md_text = text.split(f"</think>")
        if len(base_text.removeprefix("<think>")) < 6:
            base_text = None
    else:
        md_text = text
    try:
        html = markdown.markdown(
            md_text,
            extensions=extensions,
            extension_configs={
                "codehilite": {
                    "guess_lang": True,
                    "use_pygments": True,
                    "noclasses": False
                }
            },
            output_format="html5"
        )
        soup = BeautifulSoup(html, "html.parser")

        if base_text:
            soupB = BeautifulSoup(base_text, "html.parser")
            think = soupB.find('think')

            button_tag = soupB.new_tag('button', **{'class': 'toggle-think'})
            button_tag.string = 'Thoughts'
            content_div = soupB.new_tag('div', **{'class': 'think-content'})
            
            content_div.append(BeautifulSoup(markdown.markdown(think.string, output_format="html5"), "html.parser"))

            think.string = ''
            think.append(button_tag)
            think.append(content_div)

            base_text = str(soupB)

        copy_svg = '''
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>'''

        for pre in soup.find_all("pre"):
            pre['style'] = pre.get('style', '') + ' position: relative;'

            copy_btn = soup.new_tag("button", **{"class": "copy-btn", "type": "button", "aria-label": "Copia codice"})
            copy_btn.append(BeautifulSoup(copy_svg, "html.parser"))

            pre.insert(0, copy_btn)

        for table in soup.find_all("table"):
            wrapper = soup.new_tag("div", **{"class": "table-wrapper"})
            table.wrap(wrapper)
        return str(base_text) + f"</think>\n" + str(soup) if base_text else str(soup)
    except Exception as e:
        print(f"Errore in convert_markdown: {e}")
        return text