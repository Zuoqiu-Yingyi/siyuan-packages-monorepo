# Run an arbitrary command in every git submodule directory.
# Usage (from workspace/): pnpm run submodule:batch -- <command> [args...]
# Example: pnpm run submodule:batch -- git add .

def --wrapped main [...args: string] {
    if ($args | is-empty) {
        error make { msg: "Usage: pnpm run submodule:batch <command> [args...]" }
    }

    let root = ($env.FILE_PWD | path join "../.." | path expand)
    let gitmodules = ($root | path join ".gitmodules")
    let cmd = ($args | first)
    let cmd_args = ($args | skip 1)

    let paths = (
        open $gitmodules
        | lines
        | where { |line| ($line | str trim | str starts-with "path =") }
        | each { |line| $line | str trim | str replace "path = " "" | str trim }
    )

    for submodule_path in $paths {
        let abs_path = ($root | path join $submodule_path)
        if ($abs_path | path exists) {
            print ""
            print $"(ansi green)> cd ($submodule_path)(ansi reset)"
            print $"(ansi cyan)> ($cmd) ($cmd_args | str join ' ')(ansi reset)"
            cd $abs_path
            if ($cmd_args | is-empty) {
                run-external $cmd
            } else {
                run-external $cmd ...$cmd_args
            }
        } else {
            print $"(ansi yellow)Skipping ($submodule_path) \(not initialized\)(ansi reset)"
        }
    }
}
