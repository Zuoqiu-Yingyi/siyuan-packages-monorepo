#!/usr/bin/env nu
export def pnpm-update [path: string] {
    cd $path
    ^pnpm update
}

export def pnpm-outdated [path: string] {
    cd $path
    ^pnpm outdated
}

export def get-paths [] {
    let paths = (ls ./tools | where type == dir | get name)
    let paths = $paths | append (ls ./packages | where type == dir | get name)
    $paths
}
