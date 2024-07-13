#!/usr/bin/env nu
use utils.nu [get-paths, pnpm-update]

let paths = get-paths
$paths | each {|path|
    pnpm-update $path
    $path
}
