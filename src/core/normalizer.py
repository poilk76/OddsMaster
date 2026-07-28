from unidecode import unidecode
import string

PREFIXES = [
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
    "persik"
]

SUFFIXES = [
    "fc", "afc", "cf", "cfc", "united", "city", "town", "rovers", "athletic",
    "wanderers", "rangers", "albion", "county", "villa", "hotspur", "forest",
    "palace", "wednesday", "orient", "argyle", "alexandra", "vale",
    "athletic club", "cd", "sc", "ac", "as", "us", "if", "ik", "ff", "bk",
    "sk", "fk", "nk", "hk", "jk", "pfc", "mfk", "msk", "calcio", "club",
    "sv", "tsv", "tsg", "vfb", "vfl", "fsv", "fußballclub",
    "voetbal vereniging", "vv", "esporte clube", "ec", "gd", "se", "cr","cf",
    "crb", "grêmio", "sporting clube", "balompié",
]

table = str.maketrans("", "", string.punctuation)

def remove_prefixes_and_suffixes(text:str) -> str:

    text_lower = text.lower()
    text_splitted = text_lower.split(' ')

    return ' '.join(
        [
            word for word in text_splitted\
            if not word in PREFIXES and\
               not word in SUFFIXES and\
               word != ""
        ])

def is_word_a_number(text:str) -> bool:

    text_striped = text.strip()

    try:
        float(text_striped)
    except:
        return False

    return True

def remove_punctuation(text: str) -> str:
    return text.translate(table)

def remove_numbers(text:str) -> str:

    text_striped = text.strip()
    text_splitted = text_striped.split(' ')

    return ' '.join(
        [
            word for word in text_splitted\
            if not is_word_a_number(word)
        ])

def remove_unwanted_numbers_and_punctuation(text:str) -> str:

    text_without_punctuation = remove_punctuation(text)
    text_without_numbers = remove_numbers(text_without_punctuation)

    return text_without_numbers

def normalize(text: str) -> str:

    text_striped = text.strip()
    text_lower = text_striped.lower()

    text_without_numbers_and_punctuation = remove_unwanted_numbers_and_punctuation(text_lower)
    text_without_prefixes_and_suffixes = remove_prefixes_and_suffixes(text_without_numbers_and_punctuation)

    return unidecode(text_without_prefixes_and_suffixes)
