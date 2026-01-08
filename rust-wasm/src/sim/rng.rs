#[derive(Clone, Debug)]
pub(crate) struct Lcg64 {
  state: u64,
}

impl Lcg64 {
  pub(crate) fn new(seed: u64) -> Self {
    Self { state: seed | 1 } // avoid zero
  }
  pub(crate) fn next_u32(&mut self) -> u32 {
    self.state = self.state.wrapping_mul(6364136223846793005).wrapping_add(1);
    (self.state >> 32) as u32
  }
}
