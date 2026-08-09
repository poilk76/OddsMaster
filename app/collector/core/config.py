from dataclasses import dataclass
from core.normalization import Normalizer

DEFAULT_ALIASES:tuple[str] = [
    "fc", "afc", "cf", "cd", "sc", "ac", "as", "ss", "ssc", "us", "usd",
    "ud", "rc", "rcd", "ca", "cs", "csd", "ec", "gd", "sd", "se", "aa", "ad",
    "ae", "aj", "cp", "kf", "nk", "fk", "sk", "bk", "if", "ik", "ff", "hk",
    "jk", "mfk", "msk", "pfc", "fsv", "sv", "sg", "spvgg", "vfb", "vfl",
    "vfr", "tsg", "tsv", "tus", "borussia", "racing",
    "sportivo", "athletic", "athletico", "atletico", "atlético", "deportivo",
    "club", "club atlético", "club deportivo", "olympique", "olimpia",
    "dynamo", "dinamo", "torpedo", "lokomotiv", "spartak", "cska", "zenit",
    "shakhtar", "legia", "wisła", "górnik", "widzew", "polonia", "łks", "ks",
    "mks", "gks", "associazione", "associazione sportiva", "unione",
    "unione sportiva", "polisportiva", "asd", "football club",
    "football association", "calcio", "1. fc", "1. fsv", "royal",
    "royale union", "union", "stade", "standard", "étoile",
    "étoile sportive", "es", "js", "mc", "na", "rs", "wa", "al", "ps",
    "persik", "fc", "afc", "cf", "cfc", "united", "city", "town", "rovers", "athletic",
    "wanderers", "rangers", "albion", "county", "villa", "hotspur", "forest",
    "palace", "wednesday", "orient", "argyle", "alexandra", "vale",
    "athletic club", "cd", "sc", "ac", "as", "us", "if", "ik", "ff", "bk",
    "sk", "fk", "nk", "hk", "jk", "pfc", "mfk", "msk", "calcio", "club",
    "sv", "tsv", "tsg", "vfb", "vfl", "fsv", "fußballclub",
    "voetbal vereniging", "vv", "esporte clube", "ec", "gd", "se", "cr","cf",
    "crb", "grêmio", "sporting clube", "balompié"
]

@dataclass
class NormalizerConfig:
    lower: bool = True
    remove_aliases:bool = True
    remove_accents:bool = True
    remove_punctuation:bool = True
    remove_numbers:bool = True
    alisases:tuple[str,...] = DEFAULT_ALIASES

@dataclass
class MatcherConfig:
    normalizer:Normalizer
    names_match_treashold:int=80 # in %
    category_match_treashold:int=90 # in %
    allowed_time_slippage:int=30 
