#!/usr/bin/env nu
export def pnpm-update [path: string] {
    cd $path
    ^pnpm update
}

export def pnpm-outdated [path: string] {
    cd $path
    ^pnpm outdated
}

export def pnpm-prune [path: string] {
    cd $path
    ^pnpm prune
}

def ls-dir [path: string]: nothing -> list<string> {
    ls $path | where type == dir | get name
}

export def get-paths []: nothing -> list<string> {
    let paths = (ls-dir ./tools)
    let paths = $paths | append (ls-dir ./packages)
    $paths
}
