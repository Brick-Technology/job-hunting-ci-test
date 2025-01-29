// https://cucumber-rs.github.io/cucumber/main/quickstart.html
use cucumber::then;
use cucumber::when;
use cucumber::{given, World};
// use tokio::time::{sleep, Duration};

// These `Cat` definitions would normally be inside your project's code,
// not test code, but we create them here for the show case.
#[derive(Debug, Default)]
struct Cat {
    pub hungry: bool,
}

impl Cat {
    fn feed(&mut self) {
        self.hungry = false;
    }
}

// `World` is your shared, likely mutable state.
// Cucumber constructs it via `Default::default()` for each scenario.
#[derive(Debug, Default, World)]
pub struct AnimalWorld {
    cat: Cat,
}

// Don't forget to additionally `use tokio::time::{sleep, Duration};`.
#[given(regex = r"^a (hungry|satiated) cat$")]
async fn hungry_cat(world: &mut AnimalWorld, state: String) {
    // sleep(Duration::from_secs(1)).await;

    match state.as_str() {
        "hungry" => world.cat.hungry = true,
        "satiated" => world.cat.hungry = false,
        _ => unreachable!(),
    }
}

#[when("I feed the cat")]
async fn feed_cat(world: &mut AnimalWorld) {
    // sleep(Duration::from_secs(2)).await;

    world.cat.feed();
}

#[then("the cat is not hungry")]
async fn cat_is_fed(world: &mut AnimalWorld) {
    // sleep(Duration::from_secs(1)).await;

    assert!(!world.cat.hungry);
}

#[tokio::main]
async fn main() {
    AnimalWorld::run("tests/features/book/quickstart/simple.feature").await;
}

/*
// Steps are defined with `given`, `when` and `then` attributes.
// #[given("a hungry cat")]
// fn hungry_cat(world: &mut AnimalWorld) {
//     world.cat.hungry = true;
// }

#[given(regex = r"^a (hungry|satiated) cat$")]
fn hungry_cat(world: &mut AnimalWorld, state: String) {
    match state.as_str() {
        "hungry" =>  world.cat.hungry = true,
        "satiated" =>  world.cat.hungry = false,
        _ => unreachable!(),
    }
}

// #[given(expr = "a {word} cat")]
// fn hungry_cat(world: &mut AnimalWorld, state: String) {
//     match state.as_str() {
//         "hungry" =>  world.cat.hungry = true,
//         "satiated" =>  world.cat.hungry = false,
//         s => panic!("expected 'hungry' or 'satiated', found: {s}"),
//     }
// }

#[when("I feed the cat")]
fn feed_cat(world: &mut AnimalWorld) {
    world.cat.feed();
}

#[then("the cat is not hungry")]
fn cat_is_fed(world: &mut AnimalWorld) {
    assert!(!world.cat.hungry);
}

// This runs before everything else, so you can set up things here.
fn main() {
    // You may choose any executor you like (`tokio`, `async-std`, etc.).
    // You may even have an `async` main, it doesn't matter. The point is that
    // Cucumber is composable. :)
    futures::executor::block_on(AnimalWorld::run(
        "tests/features/book/quickstart/simple.feature",
    ));
}
*/
