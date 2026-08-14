from unidecode import unidecode
from string import punctuation
from dataclasses import dataclass

DEFAULT_ALIASES:tuple[str] = (
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
    "unione sportiva", "sportive", "polisportiva", "asd", "football club",
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
)

PUNCTUATION_REMOVE_TABLE = str.maketrans("","",punctuation)

@dataclass
class NormalizerConfig:
    lower: bool = True
    remove_aliases:bool = True
    remove_accents:bool = True
    remove_punctuation:bool = True
    remove_numbers:bool = True
    aliases:tuple[str,...] = DEFAULT_ALIASES

class Normalizer:

    def __init__(self,config: NormalizerConfig | None = None) -> None:

        self.config:NormalizerConfig = config or NormalizerConfig()

    def __aliases_remover(self,text:str) -> str:

        return " ".join(word for word in text.split(' ')\
                        if not word.lower() in self.config.aliases)

    def __accents_remover(self,text:str) -> str:

        return unidecode(text)

    def __punctuatuin_remover(self,text:str) -> str:

        return text.translate(PUNCTUATION_REMOVE_TABLE)

    def __is_word_a_number(self,word:str) -> bool:

        word.replace(',','.')
        word.strip('. ')

        try:
            float(word)
            return True
        except:
            return False

    def __numbers_remover(self,text:str) -> str:

        return " ".join(word for word in text.split(' ')\
                        if not self.__is_word_a_number(word))

    def normalize(self,text:str) -> str:

        text = text.strip()

        if not isinstance(text,str): return ""

        if self.config.lower:
            text = text.lower()

        if self.config.remove_punctuation:
            text = self.__punctuatuin_remover(text)

        if self.config.remove_aliases:
            text = self.__aliases_remover(text)

        if self.config.remove_accents:
            text = self.__accents_remover(text)

        if self.config.remove_numbers:
            text = self.__numbers_remover(text)

        return text

