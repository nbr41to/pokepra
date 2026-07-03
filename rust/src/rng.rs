//! シミュレーション用のシード付き乱数生成器。
//!
//! `ChaCha8Rng` は再現性のある乱数列を生成できる暗号論的擬似乱数。
//! 同じシードに対して同じ結果が返ることが保証されるので、
//! デバッグやテスト時に値を固定したい場面で扱いやすい。

use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;

#[inline]
pub fn seeded_rng(seed: u64) -> ChaCha8Rng {
    ChaCha8Rng::seed_from_u64(seed)
}
