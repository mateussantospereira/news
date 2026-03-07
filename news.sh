#!/bin/bash

ler_centralizado() {
    local arquivo=$1
    local largura_texto=80
    local largura_terminal=$(tput cols)

    local margem=$(( (largura_terminal - largura_texto) / 2 ))
    if [ $margem -lt 2 ]; then margem=2; fi

    local espacos=$(printf '%*s' "$margem")

    fmt -w $largura_texto "$arquivo" | sed "s/^/$espacos/" | less -R
}

# Estilo Tokyo Night para o FZF
# Removi o --height fixo para ele expandir conforme o terminal
export  FZF_DEFAULT_OPTS=${YT_X_FZF_OPTS:-'
    --color=fg:#d0d0d0,fg+:#ffffff,bg:"",bg+:#000000
    --color=hl:#5f87af,hl+:#5fd7ff,info:#afaf87,marker:#87ff00
    --color=prompt:#87d700,spinner:#87d700,pointer:#87d700,header:#afd75f
    --color=border:#262626,label:#aeaeae,query:#d9d9d9
    --border="rounded" --layout=reverse --margin=5% --padding=1
    --border="rounded" --border-label="" --preview-window="border-rounded" --prompt="> "
    --marker=">" --pointer="->" --separator="─" --scrollbar="│"
  '}

# 1. Seleção da Fonte (Ocupando a tela cheia)
# Note que tirei o --height aqui para ele herdar a margem global de 5%
FONTE=$(printf "REVISTA OESTE\nEPOCH TIMES BRASIL" | fzf \
    --header=" [ENTER] Selecionar Fonte | [ESC] Sair " \
    --border-label=" 📚 JORNAIS DISPONÍVEIS " \
    --info=hidden) # hidden remove a contagem '2/2' para ficar mais limpo

# Sai se o usuário apertar ESC
if [ -z "$FONTE" ]; then
    exit 0
fi

# Define o SLUG baseado na escolha
case "$FONTE" in
    "REVISTA OESTE")
        SLUG="oeste"
        LABEL=" 📰 REVISTA OESTE "
        ;;
    "EPOCH TIMES BRASIL")
        SLUG="epoch"
        LABEL=" 📰 EPOCH TIMES BRASIL "
        ;;
esac

# 2. Pega a lista
clear
echo " ⌛ Carregando notícias de $FONTE..."
LISTA_FORMATADA=$(node src/index.js "$SLUG" | jq -r '.[] | "\(.title)|\(.url)"')

# 3. Seleção de Manchete (Também em tela cheia)
ESCOLHA=$(echo "$LISTA_FORMATADA" | fzf \
    --delimiter="\|" \
    --with-nth=1 \
    --header=" [ENTER] Ler Notícia | [ESC] Voltar ao Menu Principal " \
    --border-label="$LABEL" \
    --info=inline)

# 4. Ação após o Enter
if [ ! -z "$ESCOLHA" ]; then
    URL=$(echo "$ESCOLHA" | cut -d'|' -f2)
    TITULO=$(echo "$ESCOLHA" | cut -d'|' -f1)

    clear
    echo " ⌛ Abrindo: $TITULO..."

    node src/acervo.js "$URL" > /tmp/noticia.txt
    ler_centralizado /tmp/noticia.txt

    # Retorna ao início (Menu de Fontes)
    exec "$0"
else
    # Se apertar ESC na manchete, volta para a escolha de fonte
    exec "$0"
fi
