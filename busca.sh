#!/bin/bash

ler_centralizado() {
    local arquivo=$1
    local largura_texto=80
    local largura_terminal=$(tput cols) # Pega a largura real do terminal agora
    
    # Calcula a margem esquerda: (Total - Texto) / 2
    local margem=$(( (largura_terminal - largura_texto) / 2 ))
    
    # Garante que a margem não seja negativa em telas pequenas
    if [ $margem -lt 2 ]; then margem=2; fi
    
    # Cria a string de espaços para o sed
    local espacos=$(printf '%*s' "$margem")
    
    # fmt quebra as linhas em 80, sed empurra para a direita, less exibe.
    fmt -w $largura_texto "$arquivo" | sed "s/^/$espacos/" | less -R
}

# Estilo Tokyo Night para o FZF
export FZF_DEFAULT_OPTS="
  --color=fg:#c0caf5,bg:#1a1b26,hl:#bb9af7 
  --color=fg+:#ffffff,bg+:#24283b,hl+:#7dcfff 
  --border='rounded' --layout=reverse --margin=5% --padding=1
"

SLUG="oeste"

# 1. Pega a lista (usa o cache do seu index.js)
# Usamos o JQ para formatar a saída para o FZF
LISTA_FORMATADA=$(node index.js "$SLUG" | jq -r '.[] | "\(.title)|\(.url)"')

# 2. Seleção de Manchete
# O FZF aqui serve apenas como um "Menu de Escolha"
ESCOLHA=$(echo "$LISTA_FORMATADA" | fzf \
    --delimiter="\|" \
    --with-nth=1 \
    --header=" [ENTER] Abrir no Vim | [ESC] Sair " \
    --border-label=" 📰 SELECIONE A MANCHETE " \
    --info=inline)

# 3. Ação após o Enter
if [ ! -z "$ESCOLHA" ]; then
    URL=$(echo "$ESCOLHA" | cut -d'|' -f2)
        TITULO=$(echo "$ESCOLHA" | cut -d'|' -f1)

    clear
    echo " ⌛ Abrindo: $TITULO..."



    # O acervo.js busca o conteúdo (cache ou web)
    node acervo.js "$URL" > /tmp/noticia.txt

    ler_centralizado /tmp/noticia.txt
    # Retorna ao menu após fechar o Vim
    exec "$0"
fi
