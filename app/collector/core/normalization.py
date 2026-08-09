from unidecode import unidecode
from string import punctuation
from core.config import NormalizerConfig

PUNCTUATION_REMOVE_TABLE = str.maketrans("","",punctuation)

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

        if isinstance(text,str): return ""

        if self.config.lower:
            text = text.lower()

        if self.config.remove_aliases:
            text = self.__aliases_remover(text)

        if self.config.remove_accents:
            text = self.__accents_remover(text)

        if self.config.remove_punctuaction:
            text = self.__punctuatuin_remover(text)

        if self.config.remove_numbers:
            text = self.__numbers_remover(text)

        return text