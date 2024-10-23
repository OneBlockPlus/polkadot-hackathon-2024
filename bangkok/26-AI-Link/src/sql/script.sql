CREATE TABLE `ai_link`.`models` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `client_address` VARCHAR(256) NOT NULL,
  `model_url` VARCHAR(256) NOT NULL,
  `round` BIGINT NOT NULL,
  `creation_date` DATETIME NOT NULL,
  `local_model` TINYINT NOT NULL DEFAULT 1 COMMENT 'local model === 1\nglobal model === 0',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unq_client_round` (`client_address` ASC, `model_url` ASC, `round` ASC) VISIBLE);
