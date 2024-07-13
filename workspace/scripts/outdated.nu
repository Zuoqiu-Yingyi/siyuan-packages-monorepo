#!/usr/bin/env nu
use utils.nu [get-paths, pnpm-outdated]

let paths = get-paths
$paths | each {|path|
    pnpm-outdated $path
    $path
}
