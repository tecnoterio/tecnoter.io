pub fn handle(args: Vec<&str>) -> String {
    if args.is_empty() {
        return "Usage: man [command]. Try man help, man ls, man bbs.".to_string();
    }

    let cmd = args[0];
    match cmd {
        "help" => "NAME\n    help - Show available commands\n\nSYNOPSIS\n    help\n\nDESCRIPTION\n    Displays a list of all commands recognized by the tecnoter.io shell.".to_string(),
        "ls" => "NAME\n    ls - List directory contents\n\nSYNOPSIS\n    ls [path]\n\nDESCRIPTION\n    Lists files and subdirectories in the current or specified path.".to_string(),
        "bbs" => "NAME\n    bbs - Launch the Bulletin Board System\n\nSYNOPSIS\n    bbs\n\nDESCRIPTION\n    Enters the main tecnoter.io interactive node.".to_string(),
        "top" => "NAME\n    top - Display system processes\n\nSYNOPSIS\n    top\n\nDESCRIPTION\n    Provides a dynamic real-time view of a running system.".to_string(),
        "who" => "NAME\n    who - List online users\n\nSYNOPSIS\n    who\n\nDESCRIPTION\n    Shows who is currently logged on to the tecnoter node.".to_string(),
        "date" => "NAME\n    date - Display system date and time\n\nSYNOPSIS\n    date\n\nDESCRIPTION\n    Displays the current node system time.".to_string(),
        "motd" => "NAME\n    motd - Show Message of the Day\n\nSYNOPSIS\n    motd\n\nDESCRIPTION\n    Displays the system welcome message and node information.".to_string(),
        "social" => "NAME\n    social - Social media connections\n\nSYNOPSIS\n    social [network]\n\nDESCRIPTION\n    Displays connected social networks or opens the specified network in a new uplink.".to_string(),
        _ => format!("No manual entry for {}", cmd),
    }
}
