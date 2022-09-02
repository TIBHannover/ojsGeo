<?php
/**
 * @file plugins/generic/optimetaGeo/classes/components/forms/PublicationForm.php
 *
 * Copyright (c) 2021+ OPTIMETA project
 * 
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class PublicationForm
 * @ingroup plugins_generic_optimetageo
 *
 * @brief A preset form for setting a publication's spatio-temporal metadata
 */

namespace Optimeta\Geo\Components\Forms;

use \PKP\components\forms\FormComponent;
use \PKP\components\forms\FieldTextarea;

class PublicationForm extends FormComponent
{
    /** @copydoc FormComponent::$id */
    public $id = OPTIMETA_GEO_FORM_NAME;

    /** @copydoc FormComponent::$method */
    public $method = 'PUT';

    /** @copydoc FormComponent::$action */
    public $action = '';

    /** @copydoc FormComponent::$successMessage */
    public $successMessage = '';

    /**
     * Constructor
     *
     * @param $action string URL to submit the form to
     * @param $publication Publication The publication to change settings for
     */
    public function __construct($action, $publication, $successMessage)
    {
        $this->action = $action;
        $this->successMessage = $successMessage;

        $this->addField(new FieldTextarea(
            OPTIMETA_GEO_DB_FIELD_TIME_PERIODS, [
                'label' => __('plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal'),
                'description' => '',
                'isMultilingual' => false,
                'value' => $publication->getData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS)
            ]));

        $this->addField(new FieldTextarea(
            OPTIMETA_GEO_DB_FIELD_SPATIAL, [
            'label' => __('plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial'),
            'description' => '',
            'isMultilingual' => false,
            'value' => $publication->getData(OPTIMETA_GEO_DB_FIELD_SPATIAL)
        ]));

        $this->addField(new FieldTextarea(
            OPTIMETA_GEO_DB_FIELD_ADMINUNIT, [
            'label' => __('plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit'),
            'description' => '',
            'isMultilingual' => false,
            'value' => $publication->getData(OPTIMETA_GEO_DB_FIELD_ADMINUNIT)
        ]));
    }
}
