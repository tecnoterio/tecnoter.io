use crate::state::SystemState;

pub fn handle(state: &SystemState, args: Vec<&str>) -> String {
    if args.is_empty() {
        let mut output = String::from("Connected Social Networks:\n");
        if state.socials.is_empty() {
            output.push_str(" No social networks configured.");
        } else {
            for social in &state.socials {
                output.push_str(&format!(" - {}: {}\n", social.name, social.url));
            }
            output.push_str("\nUsage: social [network] to open in a new link.");
        }
        output
    } else {
        let network = args[0].to_lowercase();
        let found = state.socials.iter().find(|s| s.name.to_lowercase() == network);
        if let Some(social) = found {
            format!("_OPEN_URL_{}", social.url)
        } else {
            format!("Social network not found: {}", network)
        }
    }
}
