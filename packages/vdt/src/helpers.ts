export function trimRight(str: string) {
    var index = str.length;

    while (index-- && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(0, index + 1);
}

export function isWhiteSpace(charCode: number) {
    return (
        (charCode <= 160 && (charCode >= 9 && charCode <= 13) || 
            charCode == 32 || 
            charCode == 160
        ) ||
        charCode == 5760 || 
        charCode == 6158 ||
        (charCode >= 8192 && 
            (
                charCode <= 8202 || 
                charCode == 8232 ||
                charCode == 8233 || 
                charCode == 8239 || 
                charCode == 8287 || 
                charCode == 12288 || 
                charCode == 65279
            )
        )
    );
}

export const selfClosingTags: Record<string, true> = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'command': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'menuitem': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
};

export const textTags: Record<string, true> = {
    style: true,
    script: true,
    textarea: true
}
