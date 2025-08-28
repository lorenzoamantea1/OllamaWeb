import markdown
from bs4 import BeautifulSoup
from pygments.formatters import HtmlFormatter

def handle_think(full_thinking_text_raw=""):
    soup = BeautifulSoup(full_thinking_text_raw, "html.parser")
    think = soup.find('think')

    button_tag = soup.new_tag('button', **{'class': 'toggle-think'})
    button_tag.string = 'Thoughts'
    content_div = soup.new_tag('div', **{'class': 'think-content'})
            
    content_div.append(BeautifulSoup(markdown.markdown(think.string, output_format="html5"), "html.parser"))

    think.string = ''
    think.append(button_tag)
    think.append(content_div)

    return str(soup)

def validate_think(full_thinking_text_raw=""):
    soup = BeautifulSoup(full_thinking_text_raw, "html.parser")
    think_tag = soup.find("think")
    
    if think_tag and think_tag.get_text(strip=True):
        return True
    return False

def convert_markdown(full_thinking_text_raw="", full_text=""):
    HtmlFormatter().get_style_defs('.codehilite')
    extensions = ["fenced_code", "codehilite", "tables"]

    valid_thinking = validate_think(full_thinking_text_raw)

    try:
        html = markdown.markdown(
            full_text,
            extensions=extensions,
            extension_configs={
                "codehilite": {
                    "guess_lang": False,
                    "use_pygments": True,
                    "noclasses": False
                }
            },
            output_format="html5"
        )
        mdSoup = BeautifulSoup(html, "html.parser")

        if valid_thinking:
            full_thinking_text = handle_think(full_thinking_text_raw)
        else:
            full_thinking_text = full_thinking_text_raw

        copy_svg = '''
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>'''

        for pre in mdSoup.find_all("pre"):
            pre['style'] = pre.get('style', '') + ' position: relative;'

            copy_btn = mdSoup.new_tag("button", **{"class": "copy-btn", "type": "button", "aria-label": "Copia codice"})
            copy_btn.append(BeautifulSoup(copy_svg, "html.parser"))

            pre.insert(0, copy_btn)

        for table in mdSoup.find_all("table"):
            wrapper = mdSoup.new_tag("div", **{"class": "table-wrapper"})
            table.wrap(wrapper)

        if valid_thinking:
            return str(full_thinking_text)+str(mdSoup)
        else:
            return str(mdSoup)
    except Exception as e:
        print(f"Errore in convert_markdown: {e}")
        return full_text